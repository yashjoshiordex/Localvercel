import { Page, Modal, Text } from '@shopify/polaris';

interface Iprops {
  active:boolean,
  setActive:Function,
  handleConfirmation:() => void,
}
const ConfirmationModal = ({active, setActive, handleConfirmation}:Iprops) => {
  // const [active, setActive] = useState(false);

  // const handleOpen = useCallback(() => setActive(true), []);
  // const handleClose = useCallback(() => setActive(false), []);

  // const handleConfirm = () => {
  //   // Perform your confirmed action here (e.g., delete, submit, etc.)
  //   console.log('Confirmed!');
  //   handleModal();
  // };

  return (
    <Page>
      <Modal
        open={active}
        onClose={() => setActive(false)}
        title="Are you sure?"
        primaryAction={{
          content: 'Yes, Delete',
          destructive: true,
          onAction: handleConfirmation,
        }}
      >
        <Modal.Section>
          <Text as="p">
            This action cannot be undone. Are you sure you want to delete this item?
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}


export default ConfirmationModal;