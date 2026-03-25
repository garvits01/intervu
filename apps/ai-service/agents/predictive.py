"""
Predictive Engine
Forecasts project delays using velocity analysis and statistical methods.
Uses simple linear regression and heuristics (no heavy ML deps for MVP).
"""

import logging
import statistics
from datetime import datetime, timedelta
from typing import Any

logger = logging.getLogger("haveloc-ai.predictive")


class PredictiveEngine:
    def __init__(self):
        logger.info("PredictiveEngine initialized")

    def predict(
        self,
        total_tasks: int,
        completed_tasks: int,
        velocity_history: list[float],
        target_date: str,
        blockers: int = 0,
    ) -> dict[str, Any]:
        """
        Predict project completion based on velocity trends.

        Args:
            total_tasks: Total tasks in the project
            completed_tasks: Tasks completed so far
            velocity_history: Tasks completed per sprint (last N sprints)
            target_date: Target completion date (YYYY-MM-DD)
            blockers: Number of current blockers
        """
        remaining = total_tasks - completed_tasks
        target = datetime.strptime(target_date, "%Y-%m-%d")
        today = datetime.now()

        if not velocity_history or len(velocity_history) < 2:
            return {
                "predicted_completion": target_date,
                "confidence_interval": {"low": target_date, "high": target_date},
                "on_track": True,
                "risk_score": 0.5,
                "risk_factors": ["Insufficient velocity data for prediction"],
                "recommendations": ["Track at least 3 sprints for accurate predictions"],
            }

        # ── Velocity Analysis ──
        avg_velocity = statistics.mean(velocity_history)
        velocity_stdev = statistics.stdev(velocity_history) if len(velocity_history) > 1 else 0
        velocity_trend = self._calculate_trend(velocity_history)

        # ── Projected velocity (accounting for trend) ──
        projected_velocity = max(0.1, avg_velocity + velocity_trend)

        # ── Sprints remaining ──
        sprints_remaining = remaining / projected_velocity if projected_velocity > 0 else float("inf")

        # Assume 2-week sprints
        days_remaining = sprints_remaining * 14
        predicted_date = today + timedelta(days=days_remaining)

        # ── Confidence interval ──
        if velocity_stdev > 0:
            optimistic = remaining / max(0.1, avg_velocity + velocity_stdev)
            pessimistic = remaining / max(0.1, avg_velocity - velocity_stdev)
        else:
            optimistic = sprints_remaining * 0.8
            pessimistic = sprints_remaining * 1.3

        low_date = today + timedelta(days=optimistic * 14)
        high_date = today + timedelta(days=pessimistic * 14)

        # ── Risk Analysis ──
        days_until_target = (target - today).days
        on_track = predicted_date <= target

        risk_score = self._calculate_risk_score(
            days_remaining=days_remaining,
            days_until_target=days_until_target,
            velocity_trend=velocity_trend,
            velocity_stdev=velocity_stdev,
            avg_velocity=avg_velocity,
            blockers=blockers,
        )

        risk_factors = self._identify_risk_factors(
            velocity_history=velocity_history,
            velocity_trend=velocity_trend,
            days_remaining=days_remaining,
            days_until_target=days_until_target,
            blockers=blockers,
            completed_ratio=completed_tasks / total_tasks if total_tasks > 0 else 0,
        )

        recommendations = self._generate_recommendations(
            risk_factors=risk_factors,
            remaining=remaining,
            avg_velocity=avg_velocity,
            days_until_target=days_until_target,
            blockers=blockers,
        )

        return {
            "predicted_completion": predicted_date.strftime("%Y-%m-%d"),
            "confidence_interval": {
                "low": low_date.strftime("%Y-%m-%d"),
                "high": high_date.strftime("%Y-%m-%d"),
            },
            "on_track": on_track,
            "risk_score": round(risk_score, 2),
            "risk_factors": risk_factors,
            "recommendations": recommendations,
        }

    def _calculate_trend(self, history: list[float]) -> float:
        """Simple linear regression slope for velocity trend."""
        n = len(history)
        if n < 2:
            return 0.0
        x_mean = (n - 1) / 2
        y_mean = statistics.mean(history)
        numerator = sum((i - x_mean) * (y - y_mean) for i, y in enumerate(history))
        denominator = sum((i - x_mean) ** 2 for i in range(n))
        return numerator / denominator if denominator != 0 else 0.0

    def _calculate_risk_score(self, **kwargs) -> float:
        """Composite risk score (0=no risk, 1=critical)."""
        risk = 0.0

        # Time pressure
        if kwargs["days_until_target"] > 0:
            ratio = kwargs["days_remaining"] / kwargs["days_until_target"]
            risk += min(0.4, max(0, (ratio - 1) * 0.5))
        else:
            risk += 0.4  # Past deadline

        # Declining velocity
        if kwargs["velocity_trend"] < 0:
            risk += min(0.2, abs(kwargs["velocity_trend"]) / max(kwargs["avg_velocity"], 1) * 0.3)

        # High variance
        if kwargs["avg_velocity"] > 0:
            cv = kwargs["velocity_stdev"] / kwargs["avg_velocity"]
            risk += min(0.2, cv * 0.2)

        # Blockers
        risk += min(0.2, kwargs["blockers"] * 0.05)

        return min(1.0, risk)

    def _identify_risk_factors(self, **kwargs) -> list[str]:
        factors = []
        if kwargs["velocity_trend"] < -0.5:
            factors.append(
                f"Velocity declining ({kwargs['velocity_trend']:.1f} tasks/sprint trend)"
            )
        if kwargs["days_remaining"] > kwargs["days_until_target"]:
            overshoot = kwargs["days_remaining"] - kwargs["days_until_target"]
            factors.append(
                f"Projected {overshoot:.0f} days past deadline at current velocity"
            )
        if kwargs["blockers"] > 0:
            factors.append(f"{kwargs['blockers']} active blocker(s) reducing throughput")

        recent = kwargs["velocity_history"][-3:]
        if len(recent) >= 3 and all(recent[i] < recent[i - 1] for i in range(1, len(recent))):
            factors.append("Velocity declining for 3 consecutive sprints")

        if kwargs["completed_ratio"] < 0.3 and kwargs["days_until_target"] < 30:
            factors.append("Less than 30% complete with less than 30 days remaining")

        return factors if factors else ["No significant risk factors identified"]

    def _generate_recommendations(self, **kwargs) -> list[str]:
        recs = []
        if kwargs["blockers"] > 0:
            recs.append(
                f"Resolve {kwargs['blockers']} blocker(s) immediately — each blocker reduces velocity ~5%"
            )
        if kwargs["remaining"] > 0 and kwargs["days_until_target"] > 0:
            needed_velocity = kwargs["remaining"] / (kwargs["days_until_target"] / 14)
            if needed_velocity > kwargs["avg_velocity"] * 1.2:
                recs.append(
                    f"Need {needed_velocity:.1f} tasks/sprint (current avg: {kwargs['avg_velocity']:.1f}). "
                    "Consider adding resources or reducing scope."
                )
        if "Velocity declining" in str(kwargs["risk_factors"]):
            recs.append("Conduct retrospective to identify velocity bottlenecks")
        if not recs:
            recs.append("Project is on track — maintain current velocity")
        return recs
