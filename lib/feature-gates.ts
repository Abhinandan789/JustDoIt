/**
 * Feature gates - enforce tier-based feature access
 * Used to check if a user has access to premium features
 */

import type { SubscriptionTier } from "@prisma/client";

export type FeatureName =
  | "unlimited_tasks"
  | "analytics_export"
  | "custom_reminders"
  | "api_access"
  | "team_collaboration"
  | "sso_integration";

/**
 * Feature availability by tier
 * If a feature is not listed for a tier, it's not available
 */
const FEATURES_BY_TIER: Record<SubscriptionTier, FeatureName[]> = {
  FREE: [],
  PRO: ["unlimited_tasks", "analytics_export", "custom_reminders"],
  ENTERPRISE: [
    "unlimited_tasks",
    "analytics_export",
    "custom_reminders",
    "api_access",
    "team_collaboration",
    "sso_integration",
  ],
};

export type UserCapabilities = {
  tier: SubscriptionTier;
  tasksLimit: number;
  hasFeature: (feature: FeatureName) => boolean;
};

/**
 * Get user capabilities based on their tier
 * Check subscription expiration for active status
 */
export function getUserCapabilities(user: {
  tier: SubscriptionTier;
  subscriptionExpiresAt: Date | null;
  tasksLimit: number;
}): UserCapabilities {
  // Check if subscription has expired
  const isSubscriptionActive =
    !user.subscriptionExpiresAt || user.subscriptionExpiresAt > new Date();

  // Downgrade to FREE if subscription expired
  const effectiveTier = isSubscriptionActive ? user.tier : "FREE";

  return {
    tier: effectiveTier,
    tasksLimit: user.tasksLimit,
    hasFeature: (feature: FeatureName) => {
      return FEATURES_BY_TIER[effectiveTier]?.includes(feature) ?? false;
    },
  };
}

/**
 * Check if user has access to a feature
 * Throws error if not authorized
 */
export function requireFeature(
  capabilities: UserCapabilities,
  feature: FeatureName,
  errorMessage?: string
): void {
  if (!capabilities.hasFeature(feature)) {
    throw new Error(
      errorMessage ||
        `Feature '${feature}' requires ${getMinimumTierForFeature(feature)} tier`
    );
  }
}

/**
 * Get the minimum tier required for a feature
 */
export function getMinimumTierForFeature(
  feature: FeatureName
): SubscriptionTier | null {
  const tiers: SubscriptionTier[] = ["FREE", "PRO", "ENTERPRISE"];

  for (const tier of tiers) {
    if (FEATURES_BY_TIER[tier].includes(feature)) {
      return tier;
    }
  }

  return null;
}

/**
 * Check if user has reached their task limit
 */
export function checkTaskLimit(
  capabilities: UserCapabilities,
  currentTaskCount: number
): {
  canCreateTask: boolean;
  remainingTasks: number;
  message?: string;
} {
  const unlimited = capabilities.tasksLimit === -1; // Use -1 for unlimited
  if (unlimited) {
    return { canCreateTask: true, remainingTasks: Infinity };
  }

  const remaining = capabilities.tasksLimit - currentTaskCount;
  const canCreate = remaining > 0;

  return {
    canCreateTask: canCreate,
    remainingTasks: remaining,
    message: !canCreate
      ? `Task limit of ${capabilities.tasksLimit} reached. Upgrade to PRO for unlimited tasks.`
      : remaining <= 10
        ? `Warning: ${remaining} tasks remaining. Upgrade to PRO for unlimited tasks.`
        : undefined,
  };
}

/**
 * Feature descriptions and upgrade links
 * Used for displaying locked features to users
 */
export const FEATURE_DESCRIPTIONS: Record<FeatureName, { name: string; description: string; minTier: SubscriptionTier }> = {
  unlimited_tasks: {
    name: "Unlimited Tasks",
    description: "Create as many tasks as you need without limits",
    minTier: "PRO",
  },
  analytics_export: {
    name: "Analytics Export",
    description: "Export your productivity data as CSV or PDF reports",
    minTier: "PRO",
  },
  custom_reminders: {
    name: "Custom Reminders",
    description: "Set up advanced reminder schedules and notifications",
    minTier: "PRO",
  },
  api_access: {
    name: "API Access",
    description: "Build integrations with REST API and webhooks",
    minTier: "ENTERPRISE",
  },
  team_collaboration: {
    name: "Team Collaboration",
    description: "Share tasks and collaborate with team members",
    minTier: "ENTERPRISE",
  },
  sso_integration: {
    name: "SSO Integration",
    description: "Login with company SSO (SAML, OAuth)",
    minTier: "ENTERPRISE",
  },
};

/**
 * Upgrade prompts - smart messages based on what user tried to use
 */
export function getUpgradePrompt(feature: FeatureName): string {
  const desc = FEATURE_DESCRIPTIONS[feature];
  const tier = desc.minTier;

  if (tier === "PRO") {
    return `Upgrade to PRO ($9.99/month) to unlock ${desc.name}`;
  } else if (tier === "ENTERPRISE") {
    return `Contact sales to enable ${desc.name} on your Enterprise plan`;
  }

  return "Upgrade to unlock this feature";
}
