import React from 'react';
import styled from 'styled-components';
import Form from 'react-bootstrap/Form';

interface Props<Type> {
  label: string;
  fields: Type;
  setFields: (fields: Type) => void;
  propertyKey: keyof Type;
  options: string[];
  required: boolean;
  callback?: (e: string) => void;
};


export function SelectInputGroup<Type extends { [k: string]: string | undefined }>({
  label,
  fields,
  setFields,
  propertyKey,
  options,
  required,
  callback
  }: Props<Type>) {

  const onChange = (e: any) => {
    if (callback) {
      callback(e.target.value);
    } else {
      setFields({ ...fields, [propertyKey]: e.target.value });
    }
  };

  return (
      <FormGroup>
        <FormSelect
          as="select"
          required={required}
          value={fields[propertyKey] as string}
          onChange={(e: any) => onChange(e)}
        >
        <option selected disabled key="" value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
        </FormSelect>
      </FormGroup>
  );
};

const FormGroup = styled(Form.Group)`
  display: flex;
  flex-direction: row;
  align-items: space-between;
  width: 100%;
`;

const FormSelect = styled(Form.Control)`
  width: 100%;
  height: min-content;
  padding: 7px;
  margin: 0 10px;
`;