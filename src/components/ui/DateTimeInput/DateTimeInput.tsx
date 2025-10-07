import { Field } from "@chakra-ui/react";
import DateTimePicker from 'react-datetime-picker';

import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import './DateTimeInput.css'

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface DateTimeInputProps {
  label: string;
  value: Value;
  onChange: (val: Value) => void;
  minDate?: Date;
  maxDate?: Date;
}

export default function DateTimeInput({
  label,
  value,
  onChange,
  minDate,
  maxDate,
}: DateTimeInputProps) {
  const minAllowed = minDate ?? new Date();
  const maxAllowed = maxDate ?? (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d;
  })();

  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <DateTimePicker
        value={value}
        onChange={onChange}
        disableClock
        minDate={minAllowed}
        maxDate={maxAllowed}
        calendarProps={{ locale: 'en-US' }}
        className="chakra-datetime-input"
      />
    </Field.Root>
  );
}