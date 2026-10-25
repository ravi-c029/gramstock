import { NextRequest, NextResponse } from "next/server";

// In-memory simulation state
interface SimulationState {
  isSimulating: boolean;
  incidentId: string | null;
  startedAt: number | null;
  currentStage: "Detection" | "Diagnosis" | "Recovery" | "Verification" | "Resolved";
  elapsedSeconds: number;
}

const state: SimulationState = {
  isSimulating: false,
  incidentId: null,
  startedAt: null,
  currentStage: "Resolved",
  elapsedSeconds: 0,
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const action = body.action || "start";

  if (action === "start") {
    state.isSimulating = true;
    state.incidentId = `INC-${Date.now().toString().slice(-6)}`;
    state.startedAt = Date.now();
    state.currentStage = "Detection";
    state.elapsedSeconds = 0;

    return NextResponse.json({
      success: true,
      message: "Failure injection started: SIGTERM simulated on container worker.",
      incidentId: state.incidentId,
      state,
    });
  }

  if (action === "reset") {
    state.isSimulating = false;
    state.incidentId = null;
    state.startedAt = null;
    state.currentStage = "Resolved";
    state.elapsedSeconds = 0;

    return NextResponse.json({
      success: true,
      message: "Simulation reset to normal healthy state.",
      state,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function GET() {
  if (state.isSimulating && state.startedAt) {
    const elapsed = (Date.now() - state.startedAt) / 1000;
    state.elapsedSeconds = Math.round(elapsed * 10) / 10;

    if (elapsed < 3.2) {
      state.currentStage = "Detection";
    } else if (elapsed < 7.3) {
      state.currentStage = "Diagnosis";
    } else if (elapsed < 15.8) {
      state.currentStage = "Recovery";
    } else if (elapsed < 18.2) {
      state.currentStage = "Verification";
    } else {
      state.currentStage = "Resolved";
      state.isSimulating = false;
    }
  }

  return NextResponse.json({
    simulation: state,
    benchmarkTtr: {
      detectionSeconds: 3.2,
      diagnosisSeconds: 4.1,
      recoverySeconds: 8.5,
      verificationSeconds: 2.4,
      totalSeconds: 18.2,
      targetSeconds: 30.0,
      slaStatus: "PASSED (Under 30s target)",
    },
  });
}
