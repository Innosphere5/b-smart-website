"use client";

import React from "react";
import { useShopStatus } from "@/lib/ShopStatusContext";
import DeliveryClosedPage from "@/components/DeliveryClosedPage";

export default function DeliveryClosedGate({ children }) {
  const { isDeliveryClosed } = useShopStatus();

  // When admin has closed delivery orders, show ONLY the dedicated notice page and not the rest of the site!
  if (isDeliveryClosed) {
    return <DeliveryClosedPage />;
  }

  // When delivery orders are open, render the regular website
  return <>{children}</>;
}
