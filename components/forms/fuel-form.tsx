"use client";

import { useState, useEffect } from "react";
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
import { addEvent, updateEvent, type Event } from "@/lib/data";
import { getArgentinaDate } from "@/lib/utils";

interface FuelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingEvent?: Event | null;
}

interface FuelFormData {
  totalAmount: number;
  liters?: number;
  pricePerLiter?: number;
  station?: string;
  at: string;
  note?: string;
}

export function FuelForm({
  open,
  onOpenChange,
  onSuccess,
  editingEvent,
}: FuelFormProps) {
  const [loading, setLoading] = useState(false);
  const now = getArgentinaDate();
  const defaultDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FuelFormData>({
    defaultValues: {
      totalAmount: editingEvent?.amount || 0,
      liters: editingEvent?.fuelLiters,
      pricePerLiter: editingEvent?.fuelPricePerLiter,
      station: editingEvent?.fuelStation || "",
      at: editingEvent?.at
        ? new Date(editingEvent.at).toISOString().slice(0, 16)
        : defaultDateTime,
      note: editingEvent?.note || "",
    },
  });

  useEffect(() => {
    if (editingEvent) {
      setValue("totalAmount", editingEvent.amount || 0);
      setValue("liters", editingEvent.fuelLiters);
      setValue("pricePerLiter", editingEvent.fuelPricePerLiter);
      setValue("station", editingEvent.fuelStation || "");
      setValue("at", new Date(editingEvent.at || "").toISOString().slice(0, 16));
      setValue("note", editingEvent.note || "");
    } else {
      reset({
        totalAmount: 0,
        liters: undefined,
        pricePerLiter: undefined,
        station: "",
        at: defaultDateTime,
        note: "",
      });
    }
  }, [editingEvent, open, defaultDateTime, setValue, reset]);

  const totalAmount = watch("totalAmount");
  const liters = watch("liters");
  const pricePerLiter = watch("pricePerLiter");

  const handleLitersChange = (value: string) => {
    const litersValue = parseFloat(value) || 0;
    setValue("liters", litersValue);
    if (totalAmount && litersValue > 0) {
      setValue("pricePerLiter", totalAmount / litersValue);
    }
  };

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
      const finalLiters = data.liters || (data.totalAmount && data.pricePerLiter ? data.totalAmount / data.pricePerLiter : undefined);
      const finalPricePerLiter = data.pricePerLiter || (data.totalAmount && data.liters ? data.totalAmount / data.liters : undefined);

      const eventData = {
        type: "EXPENSE_FUEL" as const,
        amount: Number(data.totalAmount),
        fuelLiters: finalLiters,
        fuelPricePerLiter: finalPricePerLiter,
        fuelStation: data.station || undefined,
        at: new Date(data.at).toISOString(),
        note: data.note || undefined,
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
      } else {
        await addEvent(eventData);
      }

      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert("Error al guardar registro de nafta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? "Editar Nafta" : "Registrar Nafta"}
          </DialogTitle>
          <DialogDescription>
            {editingEvent
              ? "Modifica el gasto de combustible"
              : "Agrega un nuevo gasto de combustible"}
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
              {loading ? "Guardando..." : editingEvent ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
