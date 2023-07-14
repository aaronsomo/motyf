import React from 'react';
import styled from 'styled-components';
import Form from 'react-bootstrap/Form';

interface Props<Type> {
  label: string;
  fields: Type;
  setFields: (fields: Type) => void;
  propertyKey: keyof Type;
  required: boolean;
};


export function SSNInput<Type extends { [k: string]: string | undefined }>({
  label,
  fields,
  setFields,
  propertyKey,
  required,
  }: Props<Type>) {

  const SSN_FORMAT = ['\\d', '\\d', '\\d', '\\-', '\\d', '\\d', '\\-', '\\d', '\\d', '\\d', '\\d', '$'];

  const setSSN = (e: any) => {
    const input = e.target.value;
    const previous = fields[propertyKey] as string;
    const regex = new RegExp(SSN_FORMAT.slice(0, input.length).join(''));

    if (input.match(regex)) {
      if ((input.length === 3 && previous.length === 2) || (input.length === 6 && previous.length === 5)) {
        setFields({...fields, [propertyKey]: input + '-'});
      } else {
        setFields({ ...fields, [propertyKey]: input});
      }
    }
  };

  return (
    <FormGroup>
      <FormInput
        type="text"
        value={fields[propertyKey]}
        placeholder={label}
        required={required}
        onChange={setSSN}
      />
    </FormGroup>
  );
};


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
