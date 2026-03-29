"use client";

import { useState } from "react";
import { PRICING_PLANS, formatPrice } from "@/lib/stripe";

interface SubscriptionPlanProps {
  currentTier: "FREE" | "PRO" | "ENTERPRISE";
  onUpgrade: (planId: string) => Promise<void>;
  isLoading?: boolean;
}

export function SubscriptionPlans({
  currentTier,
  onUpgrade,
  isLoading = false,
}: SubscriptionPlanProps) {
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);
    try {
      await onUpgrade(planId);
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
      {Object.entries(PRICING_PLANS).map(([key, plan]) => {
        const isCurrent = key === currentTier;
        const isHigher =
          (key === "ENTERPRISE" && currentTier !== "ENTERPRISE") ||
          (key === "PRO" &&
            currentTier !== "ENTERPRISE" &&
            currentTier !== "PRO");

        return (
          <div
            key={key}
            className={`relative rounded-lg border-2 transition-all ${
              isCurrent
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {isCurrent && (
              <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center text-sm font-semibold py-1">
                Current Plan
              </div>
            )}

            <div className={`p-6 ${isCurrent ? "pt-12" : ""}`}>
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>

              <div className="mb-4">
                {plan.price > 0 ? (
                  <div>
                    <div className="text-3xl font-bold">
                      ${(plan.price / 100).toFixed(2)}
                    </div>
                    <div className="text-gray-600 text-sm">/month</div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold">Free</div>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="text-sm flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {!isCurrent && isHigher && plan.priceId && (
                <button
                  onClick={() => handleUpgrade(plan.priceId!)}
                  disabled={isLoading || upgrading !== null}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    key === "ENTERPRISE"
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } ${
                    isLoading || upgrading !== null
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {upgrading === plan.priceId ? "Upgrading..." : "Upgrade"}
                </button>
              )}

              {isCurrent && (
                <button
                  disabled
                  className="w-full py-2 px-4 rounded-lg font-medium bg-gray-200 text-gray-600 cursor-not-allowed"
                >
                  Current Plan
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SubscriptionStatus({
  tier,
  expiresAt,
}: {
  tier: "FREE" | "PRO" | "ENTERPRISE";
  expiresAt?: Date | null;
}) {
  if (tier === "FREE") {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm font-medium text-yellow-800">
          You're on the Free plan. Upgrade to unlock unlimited tasks and more
          features.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-sm font-medium text-green-800">
        You're on the {tier} plan.
        {expiresAt && (
          <span>
            {" "}
            Renews on {expiresAt.toLocaleDateString()}
          </span>
        )}
      </p>
    </div>
  );
}
