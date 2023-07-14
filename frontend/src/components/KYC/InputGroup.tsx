import React from 'react';
import styled from 'styled-components';
import Form from 'react-bootstrap/Form';

interface Props<Type> {
  label: string;
  fields: Type;
  setFields: (fields: Type) => void;
  propertyKey: keyof Type;
  required: boolean;
}

export function InputGroup<Type extends { [k: string]: string | undefined }>({
  label,
  fields,
  setFields,
  propertyKey,
  required,
}: Props<Type>) {
  return (
    <FormGroup>
      <FormInput
        type="text"
        value={fields[propertyKey]}
        placeholder={label}
        required={required}
        onChange={(e: any) => setFields({ ...fields, [propertyKey]: e.target.value })}
      />
    </FormGroup>
  );
}

const FormGroup = styled(Form.Group)`
  display: flex;
  flex-direction: row;
  align-items: space-between;
  width: 100%;
`;

const FormInput = styled(Form.Control)`
  max-width: 100%;
  margin: 0 10px;
  color: black;
`;
