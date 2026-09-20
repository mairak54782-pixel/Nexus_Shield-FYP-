/**
 * config.js
 * ----------
 * Single source of truth for the backend API URL.
 *
 * For local development, set your machine's local network IP below (the
 * same one you'd see from `ipconfig` / `ifconfig`). This only needs to be
 * changed in ONE place now, instead of every screen.
 *
 * When you deploy the backend (e.g. to Render, Railway, or similar), replace
 * this with your deployed URL instead of an IP address.
 */

import { Platform } from "react-native";

const LOCAL_NETWORK_IP = "10.210.244.166"; // <-- update this if your IP changes

export const BASE_URL =
  Platform.OS === "web" ? "http://localhost:8000" : `http://${LOCAL_NETWORK_IP}:8000`;