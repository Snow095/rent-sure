
function getRiskLevel(score) {
  if (score === null || score === undefined) {
    return {
      label: "Not scored",
      description: "A RentSure risk score has not been assigned yet.",
      className: "text-[#756970]",
      barClassName: "bg-[#E8DDE1]",
      width: 0,
    };
  }

  if (score <= 29) {
    return {
      label: "Low Risk",
      description:
        "The available RentSure review information indicates a lower level of rental risk. You should still verify important details independently.",
      className: "text-[#15803D]",
      barClassName: "bg-[#15803D]",
      width: score,
    };
  }

  if (score <= 59) {
    return {
      label: "Moderate Risk",
      description:
        "Some factors require additional attention. Review the listing and supporting information carefully before making any payment.",
      className: "text-[#B45309]",
      barClassName: "bg-[#B45309]",
      width: score,
    };
  }

  return {
    label: "High Risk",
    description:
      "The listing has significant risk indicators. Exercise strong caution and do not make payment until you are satisfied with the available information.",
    className: "text-[#B91C1C]",
    barClassName: "bg-[#B91C1C]",
    width: score,
  };
}

function RiskScore({
  score = null,
  status = "pending",
  compact = false,
}) {
  const normalizedScore =
    typeof score === "number"
      ? Math.min(100, Math.max(0, score))
      : null;

  const risk = getRiskLevel(normalizedScore);

  if (status === "rejected") {
    risk.label = "High Risk / Rejected";
    risk.description =
      "This property did not pass the current RentSure verification review. Do not rely on the listing as a verified property.";
    risk.className = "text-[#B91C1C]";
    risk.barClassName = "bg-[#B91C1C]";
  }

  if (status === "needs_information") {
    risk.label = "More Information Needed";
    risk.description =
      "RentSure requires additional information before the property can complete verification.";
    risk.className = "text-[#B45309]";
    risk.barClassName = "bg-[#B45309]";
  }

  if (status === "pending" && normalizedScore === null) {
    risk.label = "Awaiting Review";
    risk.description =
      "The property has not completed the RentSure verification review yet.";
  }

  if (compact) {
    return (
      <div className="rounded-xl border border-[#E8DDE1] bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
              RentSure Risk Score
            </p>

            <p className={`mt-1 text-sm font-bold ${risk.className}`}>
              {risk.label}
            </p>
          </div>

          {normalizedScore !== null && (
            <div className="text-right">
              <p className={`text-2xl font-bold ${risk.className}`}>
                {normalizedScore}
              </p>

              <p className="text-xs text-[#756970]">/ 100</p>
            </div>
          )}
        </div>

        {normalizedScore !== null && (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-[#F1EAED]">
              <div
                className={`h-full rounded-full transition-all ${risk.barClassName}`}
                style={{ width: `${normalizedScore}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E8DDE1] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#756970]">
            RentSure Risk Score
          </p>

          <h3 className={`mt-1 text-xl font-bold ${risk.className}`}>
            {risk.label}
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756970]">
            {risk.description}
          </p>
        </div>

        {normalizedScore !== null && (
          <div className="shrink-0 text-left sm:text-right">
            <p className={`text-4xl font-bold ${risk.className}`}>
              {normalizedScore}
            </p>

            <p className="text-xs text-[#756970]">
              out of 100
            </p>
          </div>
        )}
      </div>

      {normalizedScore !== null && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs text-[#756970]">
            <span>Lower risk</span>
            <span>Higher risk</span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-[#F1EAED]">
            <div
              className={`h-full rounded-full transition-all ${risk.barClassName}`}
              style={{ width: `${normalizedScore}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-5 rounded-xl bg-[#F8EDEF] p-4">
        <p className="text-xs font-semibold text-[#7A1F3D]">
          Important
        </p>

        <p className="mt-1 text-xs leading-5 text-[#756970]">
          This score is a RentSure risk-awareness indicator based on
          information available during the platform's review process.
          It is not a legal guarantee of ownership, property condition,
          availability, agent conduct, or transaction outcome.
        </p>
      </div>
    </div>
  );
}

export default RiskScore;

