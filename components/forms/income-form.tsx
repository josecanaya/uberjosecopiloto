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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

interface IncomeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultDate?: Date;
}

interface IncomeFormData {
  amount: number;
  incomeType: "UBER" | "TIP" | "OTHER";
  at: string;
  note?: string;
}

export function IncomeForm({
  open,
  onOpenChange,
  onSuccess,
  defaultDate,
}: IncomeFormProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<IncomeFormData>({
    defaultValues: {
      amount: 0,
      incomeType: "UBER",
      at: defaultDate
        ? new Date(defaultDate).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      note: "",
    },
  });

  const onSubmit = async (data: IncomeFormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "INCOME",
          amount: Number(data.amount),
          incomeType: data.incomeType,
          at: new Date(data.at).toISOString(),
          note: data.note || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear ingreso");
      }

      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert("Error al crear ingreso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Ingreso</DialogTitle>
          <DialogDescription>
            Agrega un nuevo ingreso a tu registro
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Monto ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", {
                  required: "El monto es requerido",
                  min: { value: 0.01, message: "El monto debe ser mayor a 0" },
                })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="incomeType">Tipo</Label>
              <Select
                onValueChange={(value) =>
                  setValue("incomeType", value as "UBER" | "TIP" | "OTHER")
                }
                defaultValue="UBER"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UBER">Uber</SelectItem>
                  <SelectItem value="TIP">Propina</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </SelectContent>
              </Select>
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
