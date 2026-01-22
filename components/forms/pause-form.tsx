"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PauseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  activePause?: {
    id: string;
    pauseStartAt: Date;
    pauseReason: string | null;
  } | null;
}

export function PauseForm({
  open,
  onOpenChange,
  onSuccess,
  activePause,
}: PauseFormProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState<"SLEEP" | "FOOD" | "REST">("REST");

  const handleStartPause = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PAUSE",
          pauseStartAt: new Date().toISOString(),
          pauseEndAt: null,
          pauseReason: reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al iniciar pausa");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error al iniciar pausa");
    } finally {
      setLoading(false);
    }
  };

  const handleEndPause = async () => {
    if (!activePause) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/events/${activePause.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pauseEndAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Error al terminar pausa");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert("Error al terminar pausa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {activePause ? "Terminar Pausa" : "Iniciar Pausa"}
          </DialogTitle>
          <DialogDescription>
            {activePause
              ? "Cierra la pausa activa"
              : "Registra el inicio de una pausa"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!activePause && (
            <div className="grid gap-2">
              <Label htmlFor="reason">Motivo</Label>
              <Select
                value={reason}
                onValueChange={(value) =>
                  setReason(value as "SLEEP" | "FOOD" | "REST")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SLEEP">Dormir</SelectItem>
                  <SelectItem value="FOOD">Comer</SelectItem>
                  <SelectItem value="REST">Descanso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={activePause ? handleEndPause : handleStartPause}
            disabled={loading}
          >
            {loading
              ? "Guardando..."
              : activePause
              ? "Terminar Pausa"
              : "Iniciar Pausa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
