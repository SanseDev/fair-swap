"use client";

import { useState, useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { verifyOfferExists } from "@/lib/onchain-utils";
import { Offer } from "@/lib/types";

export function useVerifyOffer(offer: Offer | null) {
  const { connection } = useConnection();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!offer) {
      setIsValid(null);
      return;
    }

    const checkOffer = async () => {
      setIsChecking(true);
      try {
        const exists = await verifyOfferExists(
          connection,
          offer.seller,
          offer.offer_id
        );
        setIsValid(exists);
      } catch (error) {
        console.error("Error verifying offer:", error);
        setIsValid(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkOffer();
  }, [offer, connection]);

  return { isValid, isChecking };
}


