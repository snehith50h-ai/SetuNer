"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-client";
import { useConnectionStore } from "@/lib/connection-store";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/components/ui/ToastProvider";

// Synthesize pleasant emergency tone using browser Web Audio API
function playTelemetryTone(severity: string) {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = severity === "CRITICAL" ? "sawtooth" : "sine";
    const freq = severity === "CRITICAL" ? 659.25 : 523.25;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Suppressed if autoplay policy blocks audio before user interaction
  }
}

export function useRealtimeTelemetry() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { setWsConnected, recordTelemetryEvent } = useConnectionStore();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const attemptRef = useRef(0);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return;

    let wsUrl: string;
    try {
      const urlObj = new URL(API_BASE_URL);
      const proto = urlObj.protocol === "https:" ? "wss:" : "ws:";
      wsUrl = `${proto}//${urlObj.host}/ws/all`;
    } catch {
      wsUrl = "ws://127.0.0.1:8008/ws/all";
    }

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        attemptRef.current = 0;
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          if (event.data === "pong") return;
          const payload = JSON.parse(event.data);
          const type: string = payload.type || "";
          const data: any = payload.data || {};

          recordTelemetryEvent(type);

          // Targeted TanStack Query cache updates
          if (type.startsWith("VEHICLE_")) {
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
            if (data?.is_sos) {
              addToast({
                title: `🚨 Fleet Emergency SOS: ${data.registration_number || "Vehicle"}`,
                description: `Emergency alert triggered at ${data.corridor || "active corridor"}.`,
                type: "error",
              });
              if (soundEnabled) playTelemetryTone("CRITICAL");
            }
          } else if (type.startsWith("DELIVERY_")) {
            queryClient.invalidateQueries({ queryKey: ["deliveries"] });
            queryClient.invalidateQueries({ queryKey: ["delivery-events"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
          } else if (type.startsWith("INCIDENT_")) {
            queryClient.invalidateQueries({ queryKey: ["incidents"] });
            queryClient.invalidateQueries({ queryKey: ["map-incidents"] });
            queryClient.invalidateQueries({ queryKey: ["intel-incidents"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
            if (type === "INCIDENT_CREATED" && data?.severity === "CRITICAL") {
              addToast({
                title: `⛔ Critical Road Closure: ${data.title || "Hazard"}`,
                description: `Impassable segment reported on ${data.road_code || "regional corridor"}.`,
                type: "error",
              });
              if (soundEnabled) playTelemetryTone("CRITICAL");
            }
          } else if (type.startsWith("ALERT_")) {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
            queryClient.invalidateQueries({ queryKey: ["alerts-summary"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
            if (type === "ALERT_CREATED" && (data?.severity === "CRITICAL" || data?.severity === "HIGH")) {
              addToast({
                title: `🚨 ${data.severity} Threat Alert: ${data.title || "Hazard"}`,
                description: data.what_happened || "Operational threat dispatched.",
                type: data.severity === "CRITICAL" ? "error" : "warning",
              });
              if (soundEnabled) playTelemetryTone(data.severity);
            }
          } else if (type.startsWith("INTELLIGENCE_")) {
            queryClient.invalidateQueries({ queryKey: ["intel-summary"] });
            queryClient.invalidateQueries({ queryKey: ["intel-sources"] });
            queryClient.invalidateQueries({ queryKey: ["intel-incidents"] });
          }
        } catch {
          // JSON parse error or ping
        }
      };

      ws.onerror = () => {
        setWsConnected(false);
      };

      ws.onclose = () => {
        setWsConnected(false);
        attemptRef.current += 1;
        // Exponential backoff capped at 8s
        const backoff = Math.min(1000 * Math.pow(1.5, attemptRef.current), 8000);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, backoff);
      };
    } catch {
      setWsConnected(false);
    }
  }, [addToast, queryClient, recordTelemetryEvent, setWsConnected, soundEnabled]);

  useEffect(() => {
    connect();

    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send("ping");
      }
    }, 25000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    soundEnabled,
    setSoundEnabled,
  };
}
