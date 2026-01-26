"use client";

import { useState } from "react";
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
import { addEvent, updateEventById, getState } from "@/lib/apiAdapter";
import type { Event } from "@/lib/storage";

interface PauseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  activePause?: Event | null;
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
      // Verificar que no haya pausa activa
      const state = await getState();
      const hasActive = state.events.some(
        (e: Event) => e.type === "PAUSE" && e.pauseStartAt && !e.pauseEndAt
      );

      if (hasActive) {
        alert("Ya existe una pausa activa");
        setLoading(false);
        return;
      }

      await addEvent({
        type: "PAUSE",
        pauseStartAt: new Date().toISOString(),
        pauseEndAt: undefined,
        pauseReason: reason,
      });

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
      await updateEventById(activePause.id, {
        pauseEndAt: new Date().toISOString(),
      });

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
