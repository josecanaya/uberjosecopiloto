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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { setManualAdjustment, removeManualAdjustment, type ManualAdjustment } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";

interface ManualAdjustmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateKey: string;
  currentValues: {
    bruto: number;
    gastoNafta: number;
    gastoKiosco: number;
    horasEfectivas: number;
  };
  onSuccess: () => void;
}

export function ManualAdjustmentForm({
  open,
  onOpenChange,
  dateKey,
  currentValues,
  onSuccess,
}: ManualAdjustmentFormProps) {
  const [bruto, setBruto] = useState("");
  const [gastoNafta, setGastoNafta] = useState("");
  const [gastoKiosco, setGastoKiosco] = useState("");
  const [horasEfectivas, setHorasEfectivas] = useState("");

  useEffect(() => {
    if (open) {
      setBruto(currentValues.bruto.toString());
      setGastoNafta(currentValues.gastoNafta.toString());
      setGastoKiosco(currentValues.gastoKiosco.toString());
      setHorasEfectivas(currentValues.horasEfectivas.toFixed(1));
    }
  }, [open, currentValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const adjustment: ManualAdjustment = {};
    
    const newBruto = parseFloat(bruto);
    const newGastoNafta = parseFloat(gastoNafta);
    const newGastoKiosco = parseFloat(gastoKiosco);
    const newHorasEfectivas = parseFloat(horasEfectivas);

    // Solo guardar valores que sean diferentes a los calculados
    if (!isNaN(newBruto) && newBruto !== currentValues.bruto) {
      adjustment.bruto = newBruto;
    }
    if (!isNaN(newGastoNafta) && newGastoNafta !== currentValues.gastoNafta) {
      adjustment.gastoNafta = newGastoNafta;
    }
    if (!isNaN(newGastoKiosco) && newGastoKiosco !== currentValues.gastoKiosco) {
      adjustment.gastoKiosco = newGastoKiosco;
    }
    if (!isNaN(newHorasEfectivas) && newHorasEfectivas !== currentValues.horasEfectivas) {
      adjustment.horasEfectivas = newHorasEfectivas;
    }

    // Si hay algún ajuste, guardarlo
    if (Object.keys(adjustment).length > 0) {
      setManualAdjustment(dateKey, adjustment);
    }

    onSuccess();
    onOpenChange(false);
  };

  const handleClear = () => {
    if (confirm("¿Eliminar todos los ajustes manuales de hoy?")) {
      removeManualAdjustment(dateKey);
      onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Totales del Día</DialogTitle>
          <DialogDescription>
            Ajusta manualmente los valores del día. Los valores que no cambies se calcularán automáticamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bruto">Bruto ($)</Label>
              <Input
                id="bruto"
                type="number"
                step="0.01"
                value={bruto}
                onChange={(e) => setBruto(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Actual: {formatCurrency(currentValues.bruto)}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gastoNafta">Gasto Nafta ($)</Label>
              <Input
                id="gastoNafta"
                type="number"
                step="0.01"
                value={gastoNafta}
                onChange={(e) => setGastoNafta(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Actual: {formatCurrency(currentValues.gastoNafta)}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gastoKiosco">Gasto Kiosco ($)</Label>
              <Input
                id="gastoKiosco"
                type="number"
                step="0.01"
                value={gastoKiosco}
                onChange={(e) => setGastoKiosco(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Actual: {formatCurrency(currentValues.gastoKiosco)}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="horasEfectivas">Horas Efectivas</Label>
              <Input
                id="horasEfectivas"
                type="number"
                step="0.1"
                value={horasEfectivas}
                onChange={(e) => setHorasEfectivas(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Actual: {currentValues.horasEfectivas.toFixed(1)}h
              </p>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button type="button" variant="destructive" onClick={handleClear}>
              Limpiar Ajustes
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
