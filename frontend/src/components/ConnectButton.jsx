import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { toastError, toastSuccess, toastInfo } from "../utils/toast";
import { on, off, getSocket } from "../socket";

export default function ConnectButton({ targetUserId, targetName }) {
  const [status, setStatus] = useState("idle"); // idle | pending | connected | rejected
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchState = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const currentUserId = user?._id || user?.id;
      if (!currentUserId) return;
      // Only rely on requests to decide button state (ignore existing conversations)
      // 1) Accepted
      try {
        const { data } = await axios.get(
          `/api/connections/requests?status=accepted&role=any`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const currentIdStr = currentUserId.toString();
        const targetIdStr = targetUserId.toString();
        const acceptedWithTarget = (data.requests || []).find((r) => {
          const fromId =
            typeof r.from === "object" ? r.from._id || r.from : r.from;
          const toId = typeof r.to === "object" ? r.to._id || r.to : r.to;
          return (
            (fromId.toString() === currentIdStr &&
              toId.toString() === targetIdStr) ||
            (fromId.toString() === targetIdStr &&
              toId.toString() === currentIdStr)
          );
        });
        if (acceptedWithTarget) {
          setStatus("connected");
          return;
        }
      } catch (e) {}
      // 2) Pending
      try {
        const { data } = await axios.get(
          "/api/connections/requests?status=pending&role=from",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const currentIdStr = currentUserId.toString();
        const targetIdStr = targetUserId.toString();
        const pending = (data.requests || []).find((r) => {
          const fromId =
            typeof r.from === "object" ? r.from._id || r.from : r.from;
          const toId = typeof r.to === "object" ? r.to._id || r.to : r.to;
          return (
            fromId.toString() === currentIdStr &&
            toId.toString() === targetIdStr
          );
        });
        if (pending) {
          setStatus("pending");
          return;
        }
      } catch (e) {}
      setStatus("idle");
    };
    fetchState();
    // Setup socket
    const handler = (payload) => {
      if (payload && payload.request) {
        const { from, to, status: reqStatus } = payload.request;
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const currentUserId = user?._id || user?.id;
        const isRelevant =
          (from === currentUserId && to === targetUserId) ||
          (to === currentUserId && from === targetUserId);
        if (isRelevant) {
          if (reqStatus === "accepted") setStatus("connected");
          if (reqStatus === "rejected") setStatus("rejected");
        }
      }
    };
    on("request_update", handler);
    return () => off("request_update", handler);
  }, [targetUserId]);

  const sendRequest = async () => {
    try {
      setLoading(true);
      setStatus("pending");
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/connections/request",
        { toUserId: targetUserId, message: `Let’s study, ${targetName}!` },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      getSocket();
      toastSuccess("Request sent successfully! 🌿");
    } catch (err) {
      setStatus("idle");
      console.error("Failed to send request", err);
      toastError(err?.response?.data?.message || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  let label = "Connect";
  if (status === "pending") label = "Request Sent";
  if (status === "connected") label = "Connected";
  if (status === "rejected") label = "Rejected";

  return (
    <button
      onClick={sendRequest}
      disabled={loading || status === "pending" || status === "connected"}
      className={`px-3 py-2 rounded text-white ${
        status === "pending"
          ? "bg-gray-500"
          : status === "connected"
          ? "bg-green-600"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
      title={
        status === "connected"
          ? "You are already connected"
          : "Send a connection request to study together"
      }
    >
      {label}
    </button>
  );
}
