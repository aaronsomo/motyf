import React from 'react';
import Form from 'react-bootstrap/Form';

interface Props {
  offLabel: string;
  onLabel: string;
  setValue: (value: boolean) => void;
  value: boolean;
}

export const GradientSwitch: React.FC<Props> = ({ offLabel, onLabel, setValue, value }) => {
  return (
    <Form.Check custom type="switch">
      <Form.Check.Input onChange={() => setValue(!value)} bsPrefix="custom" id={onLabel} checked={value} />
      <Form.Check.Label onClick={() => setValue(!value)}>{value ? onLabel : offLabel}</Form.Check.Label>
    </Form.Check>
  );
};
