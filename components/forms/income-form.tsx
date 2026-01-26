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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addEvent, updateEventById } from "@/lib/apiAdapter";
import type { Event } from "@/lib/storage";
import { getArgentinaDate } from "@/lib/utils";

interface IncomeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingEvent?: Event | null;
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
  editingEvent,
}: IncomeFormProps) {
  const [loading, setLoading] = useState(false);
  const now = getArgentinaDate();
  const defaultDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<IncomeFormData>({
    defaultValues: {
      amount: editingEvent?.amount || 0,
      incomeType: (editingEvent?.incomeType as "UBER" | "TIP" | "OTHER") || "UBER",
      at: editingEvent?.at
        ? new Date(editingEvent.at).toISOString().slice(0, 16)
        : defaultDateTime,
      note: editingEvent?.note || "",
    },
  });

  useEffect(() => {
    if (editingEvent) {
      setValue("amount", editingEvent.amount || 0);
      setValue("incomeType", (editingEvent.incomeType as "UBER" | "TIP" | "OTHER") || "UBER");
      setValue("at", new Date(editingEvent.at || "").toISOString().slice(0, 16));
      setValue("note", editingEvent.note || "");
    } else {
      reset({
        amount: 0,
        incomeType: "UBER",
        at: defaultDateTime,
        note: "",
      });
    }
  }, [editingEvent, open, defaultDateTime, setValue, reset]);

  const onSubmit = async (data: IncomeFormData) => {
    setLoading(true);
    try {
      const eventData = {
        type: "INCOME" as const,
        amount: Number(data.amount),
        incomeType: data.incomeType,
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
      alert("Error al guardar ingreso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? "Editar Ingreso" : "Registrar Ingreso"}
          </DialogTitle>
          <DialogDescription>
            {editingEvent
              ? "Modifica el ingreso"
              : "Agrega un nuevo ingreso a tu registro"}
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
                defaultValue={watch("incomeType")}
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
              {loading ? "Guardando..." : editingEvent ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
