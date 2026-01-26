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
import { addEvent, updateEventById } from "@/lib/apiAdapter";
import type { Event } from "@/lib/storage";
import { getArgentinaDate } from "@/lib/utils";

interface KioscoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingEvent?: Event | null;
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
  editingEvent,
}: KioscoFormProps) {
  const [loading, setLoading] = useState(false);
  const now = getArgentinaDate();
  const defaultDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<KioscoFormData>({
    defaultValues: {
      amount: editingEvent?.amount || 0,
      at: editingEvent?.at
        ? new Date(editingEvent.at).toISOString().slice(0, 16)
        : defaultDateTime,
      note: editingEvent?.note || "",
    },
  });

  useEffect(() => {
    if (editingEvent) {
      setValue("amount", editingEvent.amount || 0);
      setValue("at", new Date(editingEvent.at || "").toISOString().slice(0, 16));
      setValue("note", editingEvent.note || "");
    } else {
      reset({
        amount: 0,
        at: defaultDateTime,
        note: "",
      });
    }
  }, [editingEvent, open, defaultDateTime, setValue, reset]);

  const onSubmit = async (data: KioscoFormData) => {
    setLoading(true);
    try {
      const eventData = {
        type: "EXPENSE_KIOSCO" as const,
        amount: Number(data.amount),
        at: new Date(data.at).toISOString(),
        note: data.note || undefined,
      };

      if (editingEvent) {
        await updateEventById(editingEvent.id, eventData);
      } else {
        await addEvent(eventData);
      }

      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert("Error al guardar gasto de kiosco");
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
