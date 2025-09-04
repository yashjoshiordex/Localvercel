import { Page, Modal, Text} from '@shopify/polaris';

interface Iprops {
  active:boolean,
  setActive:Function,
  handleConfirmation:() => void,
}
const ConfirmationModal = ({active, setActive, handleConfirmation}:Iprops) => {

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