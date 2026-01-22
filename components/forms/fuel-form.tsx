"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

interface FuelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultDate?: Date;
}

interface FuelFormData {
  totalAmount: number;
  liters?: number;
  pricePerLiter?: number;
  station?: string;
  odometer?: number;
  at: string;
  note?: string;
}

export function FuelForm({
  open,
  onOpenChange,
  onSuccess,
  defaultDate,
}: FuelFormProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FuelFormData>({
    defaultValues: {
      totalAmount: 0,
      liters: undefined,
      pricePerLiter: undefined,
      station: "",
      odometer: undefined,
      at: defaultDate
        ? new Date(defaultDate).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      note: "",
    },
  });

  const totalAmount = watch("totalAmount");
  const liters = watch("liters");
  const pricePerLiter = watch("pricePerLiter");

  // Auto-calcular pricePerLiter si tenemos totalAmount y liters
  const handleLitersChange = (value: string) => {
    const litersValue = parseFloat(value) || 0;
    setValue("liters", litersValue);
    if (totalAmount && litersValue > 0) {
      setValue("pricePerLiter", totalAmount / litersValue);
    }
  };

  // Auto-calcular liters si tenemos totalAmount y pricePerLiter
  const handlePricePerLiterChange = (value: string) => {
    const priceValue = parseFloat(value) || 0;
    setValue("pricePerLiter", priceValue);
    if (totalAmount && priceValue > 0) {
      setValue("liters", totalAmount / priceValue);
    }
  };

  const onSubmit = async (data: FuelFormData) => {
    setLoading(true);
    try {
      const finalLiters = data.liters || (data.totalAmount && data.pricePerLiter ? data.totalAmount / data.pricePerLiter : null);
      const finalPricePerLiter = data.pricePerLiter || (data.totalAmount && data.liters ? data.totalAmount / data.liters : null);

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "EXPENSE",
          expenseType: "FUEL",
          amount: Number(data.totalAmount),
          fuelLiters: finalLiters,
          fuelPricePerLiter: finalPricePerLiter,
          fuelStation: data.station || null,
          fuelOdometer: data.odometer ? Number(data.odometer) : null,
          at: new Date(data.at).toISOString(),
          note: data.note || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear registro de nafta");
      }

      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert("Error al crear registro de nafta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Nafta</DialogTitle>
          <DialogDescription>
            Agrega un nuevo gasto de combustible
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="totalAmount">Total ($)</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                {...register("totalAmount", {
                  required: "El total es requerido",
                  min: { value: 0.01, message: "El total debe ser mayor a 0" },
                })}
              />
              {errors.totalAmount && (
                <p className="text-sm text-destructive">
                  {errors.totalAmount.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="liters">Litros (opcional)</Label>
              <Input
                id="liters"
                type="number"
                step="0.01"
                {...register("liters")}
                onChange={(e) => handleLitersChange(e.target.value)}
              />
              {liters && totalAmount && (
                <p className="text-xs text-muted-foreground">
                  ${((totalAmount / liters) || 0).toFixed(2)}/litro
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pricePerLiter">Precio por Litro ($) (opcional)</Label>
              <Input
                id="pricePerLiter"
                type="number"
                step="0.01"
                {...register("pricePerLiter")}
                onChange={(e) => handlePricePerLiterChange(e.target.value)}
              />
              {pricePerLiter && totalAmount && (
                <p className="text-xs text-muted-foreground">
                  {(totalAmount / pricePerLiter).toFixed(2)} litros
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="station">Estación (opcional)</Label>
              <Input id="station" {...register("station")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="odometer">Odómetro (opcional)</Label>
              <Input
                id="odometer"
                type="number"
                {...register("odometer")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="at">Fecha y Hora</Label>
              <Input
                id="at"
                type="datetime-local"
                {...register("at", { required: "La fecha es requerida" })}
              />
              {errors.at && (
                <p className="text-sm text-destructive">{errors.at.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">Nota (opcional)</Label>
              <Input id="note" {...register("note")} />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
