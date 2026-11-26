'use client';

import { Boxes, DollarSign, LoaderCircle, Plus, Save, ScanBarcode, Tag } from 'lucide-react';
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ApiError, createProduct, updateProduct } from '@/lib/api';
import { toFormErrors } from '@/lib/form-errors';
import { CURRENCY } from '@/lib/format';
import type { Product } from '@/lib/types';
import {
  PRODUCT_FIELDS,
  PRODUCT_LIMITS,
  validateField,
  validateProduct,
  type FieldErrors,
  type ProductField,
  type ProductFormValues,
} from '@/lib/validation';
import { Button } from './ui/Button';

interface ProductFormProps {
  /** Si viene, el formulario edita ese producto; si no, crea uno nuevo */
  product?: Product;
  onSaved: (product: Product) => void;
  /** El producto que se editaba ya no existe en la API */
  onNotFound: () => void;
  onCancel: () => void;
  /** Avisa al contenedor cuando empieza y termina un envio, para que no se cierre a mitad */
  onBusyChange?: (busy: boolean) => void;
}

function initialValues(product?: Product): ProductFormValues {
  return {
    sku: product?.sku ?? '',
    name: product?.name ?? '',
    // Coma decimal, como se escribe en Ecuador; la validacion acepta coma o punto
    price: product ? String(product.price).replace('.', ',') : '',
    stock: product ? String(product.stock) : '0',
  };
}

export function ProductForm({
  product,
  onSaved,
  onNotFound,
  onCancel,
  onBusyChange,
}: ProductFormProps) {
  const isEdit = product !== undefined;
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState(() => initialValues(product));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function focusFirstError(fieldErrors: FieldErrors) {
    const first = PRODUCT_FIELDS.find((field) => fieldErrors[field]);
    if (!first) return;
    const input = formRef.current?.elements.namedItem(first);
    if (input instanceof HTMLInputElement) input.focus();
  }

  function handleChange(field: ProductField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    // El error se oculta al corregir; se vuelve a validar al salir del campo o al enviar
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleBlur(field: ProductField) {
    // No se marca como error un campo que el usuario solo atraveso sin escribir
    if (!values[field].trim()) return;
    setErrors((current) => ({ ...current, [field]: validateField(field, values[field]) }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const result = validateProduct(values);
    if (!result.ok) {
      setErrors(result.errors);
      setFormError(null);
      focusFirstError(result.errors);
      return;
    }

    setSubmitting(true);
    onBusyChange?.(true);
    setFormError(null);
    try {
      const saved = isEdit
        ? await updateProduct(product.id, result.data)
        : await createProduct(result.data);
      onSaved(saved);
    } catch (error) {
      if (isEdit && error instanceof ApiError && error.isNotFound) {
        onNotFound();
        return;
      }
      const mapped = toFormErrors(error);
      setErrors(mapped.fieldErrors);
      setFormError(mapped.formError);
      focusFirstError(mapped.fieldErrors);
    } finally {
      setSubmitting(false);
      onBusyChange?.(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && (
        <p
          role="alert"
          className="rounded-lg border border-accent-100 bg-accent-50 px-3 py-2 text-sm text-accent-700"
        >
          {formError}
        </p>
      )}

      <Field
        id="sku"
        label="SKU"
        icon={<ScanBarcode />}
        value={values.sku}
        error={errors.sku}
        maxLength={PRODUCT_LIMITS.skuMaxLength}
        placeholder="SKU-001"
        autoFocus
        onChange={(v) => handleChange('sku', v)}
        onBlur={() => handleBlur('sku')}
        className="font-mono"
      />

      <Field
        id="name"
        label="Nombre"
        icon={<Tag />}
        value={values.name}
        error={errors.name}
        maxLength={PRODUCT_LIMITS.nameMaxLength}
        placeholder="Mesa de roble"
        onChange={(v) => handleChange('name', v)}
        onBlur={() => handleBlur('name')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="price"
          label={`Precio (${CURRENCY})`}
          icon={<DollarSign />}
          value={values.price}
          error={errors.price}
          inputMode="decimal"
          placeholder="0,00"
          hint="Mayor que 0, hasta 2 decimales"
          onChange={(v) => handleChange('price', v)}
          onBlur={() => handleBlur('price')}
        />
        <Field
          id="stock"
          label="Stock"
          icon={<Boxes />}
          value={values.stock}
          error={errors.stock}
          inputMode="numeric"
          hint="Unidades disponibles"
          onChange={(v) => handleChange('stock', v)}
          onBlur={() => handleBlur('stock')}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <LoaderCircle className="animate-spin" /> : isEdit ? <Save /> : <Plus />}
          {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  );
}

interface FieldProps {
  id: ProductField;
  label: string;
  icon: ReactNode;
  value: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  maxLength?: number;
  inputMode?: 'text' | 'decimal' | 'numeric';
  autoFocus?: boolean;
  className?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

function Field({
  id,
  label,
  icon,
  value,
  error,
  hint,
  placeholder,
  maxLength,
  inputMode = 'text',
  autoFocus,
  className = '',
  onChange,
  onBlur,
}: FieldProps) {
  const inputId = `product-${id}`;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative mt-1.5">
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 [&_svg]:size-4 ${error ? 'text-accent-500' : 'text-slate-400'}`}
        >
          {icon}
        </span>
        <input
          id={inputId}
          name={id}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          autoFocus={autoFocus}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className={`h-10 w-full rounded-lg border bg-white pr-3 pl-9 text-sm text-slate-900 shadow-xs transition-shadow placeholder:text-slate-400 focus:ring-4 focus:outline-none ${
            error
              ? 'border-accent-500 focus:border-accent-500 focus:ring-accent-100'
              : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'
          } ${className}`}
        />
      </div>
      {message && (
        <p id={messageId} className={`mt-1.5 text-xs ${error ? 'text-accent-600' : 'text-slate-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
