import {
  reactExtension,
  useApplyAttributeChange,
  Text
} from '@shopify/ui-extensions-react/checkout';
import { Checkbox, Link } from '@shopify/ui-extensions/checkout';
import { useState } from 'react';

export default reactExtension(
  'purchase.checkout.block.render',
  () => <Extension />,
);

function Extension() {
  const [isChecked, setIsChecked] = useState(true); // Set initial state to true
  const applyAttributeChange = useApplyAttributeChange();

  const handleCheckboxChange = (newCheckedValue) => {
    setIsChecked(newCheckedValue);

    applyAttributeChange({
      type: 'updateAttribute',
      key: 'Podcast Signup',
      value: newCheckedValue ? 'TRUE' : 'FALSE',
    });
  };

  return (
    <Checkbox
      id="checkbox"
      name="checkbox"
      onChange={handleCheckboxChange}
      checked={isChecked}
    >
      <Text size='small'>
        By submitting this form and signing up for texts, you consent to receive marketing email and/or sms messages (e.g. promos, cart reminders) from 
        <Link to='https://caskcartel.com/'> CaskCartel.com </Link> at the number provided during checkout including messages sent by autodialer. Consent is not a condition of purchase. Msg & data rates may apply. Msg frequency varies. Unsubscribe at any time by replying STOP. 
        <Link to='https://caskcartel.com/pages/privacy-policy'> Privacy Policy </Link> & 
        <Link to='https://caskcartel.com/pages/terms-and-conditions'> Terms of Service </Link>
      </Text>
    </Checkbox>
  );
}
