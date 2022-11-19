import { useStoreContext } from "leva";
import { Components, createPlugin, styled, useInputContext } from "leva/plugin";

const normalize = (input) => {
  let { value, options, onClick } = input;
  let keys;
  let values;

  if (Array.isArray(options)) {
    values = options;
    keys = options.map((o) => String(o));
  } else {
    values = Object.values(options);
    keys = Object.keys(options);
  }

  if (!("value" in input)) value = values[0];
  else if (!values.includes(value)) {
    keys.unshift(String(value));
    values.unshift(value);
  }

  if (!Object.values(options).includes(value))
    (options as any)[String(value)] = value;
  return { value, settings: { keys, values, onClick } };
};
export const selectButton = createPlugin({
  normalize: normalize,
  sanitize: (value) => value,
  format: (value: any, { values }) => {
    return values.indexOf(value);
  },
  component: () => {
    const { label, value, displayValue, onUpdate, id, disabled, settings } =
      useInputContext<{
        displayValue: number;
        settings: {
          keys: string[];
          values: any[];
          onClick: (value: (path: string) => any) => void;
        };
      }>();
    const store = useStoreContext();
    return (
      <ImageContainer>
        <StyledButton
          onClick={() => {
            settings.onClick(store.get);
          }}
        >
          +
        </StyledButton>
        <Components.Select
          id={id}
          value={value}
          displayValue={displayValue}
          onUpdate={onUpdate}
          settings={settings}
          disabled={disabled}
        />
      </ImageContainer>
    );
  },
});
const ImageContainer = styled("div", {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "32px auto",
  columnGap: "$colGap",
  alignItems: "center",
  color: "$highlight2",
});
const StyledButton = styled("button", {
  display: "block",
  $reset: "",
  fontWeight: "$button",
  height: "$rowHeight",
  borderStyle: "none",
  borderRadius: "$sm",
  backgroundColor: "$elevation1",
  color: "$highlight1",
  "&:not(:disabled)": {
    color: "$highlight3",
    backgroundColor: "$accent2",
    cursor: "pointer",
    $hover: "$accent3",
    $active: "$accent3 $accent1",
    $focus: "",
  },
});
