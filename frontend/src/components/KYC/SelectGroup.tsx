import React from 'react';
import styled from 'styled-components';
import Form from 'react-bootstrap/Form';
import checkSvg from 'assets/check.svg';

interface Props<Type> {
  label: string;
  fields: Type;
  setFields: (fields: Type) => void;
  propertyKey: keyof Type;
  options: string[];
  required: boolean;
  callback?: (e: string) => void;
}

const RISK_TRANSLATIONS: Record<string, string> = {
  '1': 'I want to avoid any risk',
  '2': 'I am open to a little risk',
  '3': 'I am comfortable with some risk',
  '4': 'I want to be somewhat aggressive with my investment',
  '5': 'I want to invest very aggressively',
};

const EXPERIENCE_TRANSLATIONS: Record<string, string> = {
  '1': 'No experience',
  '2': 'Some experience',
  '3': 'I know what I am doing',
  '4': 'I have a large amount of experience',
  '5': 'I am an expert',
};

export function SelectGroup<Type extends { [k: string]: string | undefined }>({
  label,
  fields,
  setFields,
  propertyKey,
  options,
  required,
  callback,
}: Props<Type>) {
  const onChange = (e: any) => {
    if (callback) {
      callback(e.target.value);
    } else {
      setFields({ ...fields, [propertyKey]: e.target.value });
    }
  };

  const lookupOption = (option: string, property: string) => {
    if (property === 'investmentExperience' || property === 'privOffExperience') {
      return EXPERIENCE_TRANSLATIONS[option] as string;
    } else if (property === 'riskProfile') {
      return RISK_TRANSLATIONS[option];
    } else {
      return option;
    }
  };

  return (
    <FormGroup>
      <Form.Label>{label}</Form.Label>
      {options.map((option) => (
        <Checkbox type="radio" id={option} key={option}>
          <CheckboxInput
            type="radio"
            checked={fields[propertyKey] === option}
            onClick={onChange}
            onChange={onChange}
            value={option}
          />
          <CheckboxLabel color={fields[propertyKey] === option ? 'white' : '#171717'}>
            <InnerCheckbox>
              <div>{lookupOption(option, propertyKey as string)}</div>
              {fields[propertyKey] === option && <img alt="" src={checkSvg} />}
            </InnerCheckbox>
          </CheckboxLabel>
        </Checkbox>
      ))}
    </FormGroup>
  );
}

const FormGroup = styled(Form.Group)`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-left: 10px;
  background-color: transparent;
`;

const InnerCheckbox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: transparent;
`;

const Checkbox = styled(Form.Check)`
  width: 100%;
  height: min-content;
  padding: 7px 0;
  display: flex;
  padding-left: 0 !important;
  flex-direction: row;
  background-color: transparent;
`;

const CheckboxInput = styled(Form.Check.Input)`
  display: none;
  background-color: transparent;
`;

const CheckboxLabel = styled(Form.Check.Label)`
  background-color: transparent;
  color ${(props) => (props.color === 'white' ? '#171717' : 'white')};
  width: 100%;
  padding: 10px;
  border-radius: 3px;
  border: solid 2px transparent;
  border-image-slice: 1;
  background-image: linear-gradient(${(props) => props.color}, ${(props) =>
  props.color}), linear-gradient(93.87deg, #A8E0FF 4.65%, #A8B6FF 46.64%, #ECB7FF 79.12%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
`;
