import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useState } from 'preact/hooks';

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  const [isChecked, setIsChecked] = useState(true); // Set initial state to true

  /** @param {Event} event */
  const handleCheckboxChange = (event) => {
    const newCheckedValue = /** @type {HTMLInputElement} */ (event.currentTarget).checked;
    setIsChecked(newCheckedValue);

    shopify.applyAttributeChange({
      type: 'updateAttribute',
      key: 'Podcast Signup',
      value: newCheckedValue ? 'TRUE' : 'FALSE',
    });
  };

  return (
    // The consent copy is passed through the documented `label` slot (s-text + s-link),
    // which the Preact JSX typings do not model as children.
    // @ts-expect-error -- slotted label content
    <s-checkbox
      id="checkbox"
      name="checkbox"
      onChange={handleCheckboxChange}
      checked={isChecked}
    >
      <s-text slot="label" type="small">
        By submitting this form and signing up for texts, you consent to receive marketing email and/or sms messages (e.g. promos, cart reminders) from
        <s-link href='https://caskcartel.com/'> CaskCartel.com </s-link> at the number provided during checkout including messages sent by autodialer. Consent is not a condition of purchase. Msg & data rates may apply. Msg frequency varies. Unsubscribe at any time by replying STOP.
        <s-link href='https://caskcartel.com/pages/privacy-policy'> Privacy Policy </s-link> &
        <s-link href='https://caskcartel.com/pages/terms-and-conditions'> Terms of Service </s-link>
      </s-text>
    </s-checkbox>
  );
}
