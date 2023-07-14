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

export function ZipInput<Type extends { [k: string]: string | undefined }>({
  label,
  fields,
  setFields,
  propertyKey,
  required,
}: Props<Type>) {
  const ZIP_FORMAT = ['\\d', '\\d', '\\d', '\\d', '\\d', '\\$'];

  const setZip = (e: any) => {
    const input = e.target.value;
    const regex = new RegExp(ZIP_FORMAT.slice(0, input.length).join(''));

    if (input.match(regex)) {
      setFields({ ...fields, [propertyKey]: input });
    }
  };

  return (
    <FormGroup>
      <FormInput type="text" value={fields[propertyKey]} placeholder={label} required={required} onChange={setZip} />
    </FormGroup>
  );
}

const FormInput = styled(Form.Control)`
  max-width: 100%;
  margin: 0 10px;
`;

const FormGroup = styled(Form.Group)`
  display: flex;
  flex-direction: row;
  align-items: space-between;
  width: 100%;
`;
