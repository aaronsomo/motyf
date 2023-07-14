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


export function CalendarInput<Type extends { [k: string]: string | undefined }>({
  label,
  fields,
  setFields,
  propertyKey,
  required,
  }: Props<Type>) {

  const DATE_FORMAT = ['[0-1]', '\\d', '\\-', '[0-3]', '\\d', '\\-', '[1-2]', '[0|9]', '\\d', '\\d', '$'];

  const setDob = (e: any) => {
    const input = e.target.value;
    const previous = fields[propertyKey] as string;
    const regex = new RegExp(DATE_FORMAT.slice(0, input.length).join(''));

    if (input.match(regex)) {
      if ((input.length === 2 && previous.length === 1) || (input.length === 5 && previous.length === 4)) {
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
        onChange={setDob}
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
