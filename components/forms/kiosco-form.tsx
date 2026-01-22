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

interface KioscoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultDate?: Date;
  editingEvent?: {
    id: string;
    amount: number;
    at: string;
    note: string | null;
  } | null;
}

interface KioscoFormData {
  amount: number;
  at: string;
  note?: string;
}

export function KioscoForm({
  open,
  onOpenChange,
  onSuccess,
  defaultDate,
  editingEvent,
}: KioscoFormProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<KioscoFormData>({
    defaultValues: {
      amount: editingEvent?.amount || 0,
      at: editingEvent?.at
        ? new Date(editingEvent.at).toISOString().slice(0, 16)
        : defaultDate
        ? new Date(defaultDate).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      note: editingEvent?.note || "",
    },
  });

  // Resetear form cuando cambia editingEvent
  useState(() => {
    if (editingEvent) {
      setValue("amount", editingEvent.amount);
      setValue("at", new Date(editingEvent.at).toISOString().slice(0, 16));
      setValue("note", editingEvent.note || "");
    }
  });

  const onSubmit = async (data: KioscoFormData) => {
    setLoading(true);
    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : "/api/events";
      const method = editingEvent ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "EXPENSE",
          expenseType: "KIOSCO",
          amount: Number(data.amount),
          at: new Date(data.at).toISOString(),
          note: data.note || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear/actualizar gasto de kiosco");
      }

      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert("Error al crear/actualizar gasto de kiosco");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? "Editar Gasto Kiosco" : "Registrar Gasto Kiosco"}
          </DialogTitle>
          <DialogDescription>
            {editingEvent
              ? "Modifica el gasto de kiosco"
              : "Agrega un nuevo gasto de kiosco (café, agua, snack, etc.)"}
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
              <Label htmlFor="note">Nota (ej: café, agua, snack)</Label>
              <Input id="note" {...register("note")} placeholder="Ej: café y medialunas" />
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
