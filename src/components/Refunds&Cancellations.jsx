import { useState } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { X } from "lucide-react";

export default function RefundsandCancellation() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);

  return (
    <>
      <Button onClick={handleOpen} variant="text" size="sm">
        Refunds / Cancellations
      </Button>
      <Dialog open={open} handler={handleOpen} className="overflow-scroll">
        <DialogHeader className="flex justify-between items-center">
          Refunds / Cancellations
          <Button
            variant="text"
            color="red"
            onClick={handleOpen}
            className="rounded-full"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </Button>
        </DialogHeader>
        <DialogBody className="max-h-screen overflow-auto">
          <p>
            We understand that plans can change. Here is our policy for refunds
            and cancellations:
          </p>
          <ul>
            <li>
              <strong>Refund Processing:</strong> Refunds will be processed
              within 5-7 working days from the date of cancellation.
            </li>
            <li>
              <strong>Refund Method:</strong> The refund amount will be credited
              to the original payment method.
            </li>
            <li>
              <strong>Cancellation Policy:</strong> Cancellations must be made
              at least 24 hours before the scheduled dine-in time to be eligible
              for a refund.
            </li>
            <li>
              <strong>Contact Us:</strong> For any queries or support, please
              contact us at +917500431794 or sahyogsabka02@gmail.com.
            </li>
          </ul>
        </DialogBody>
      </Dialog>
    </>
  );
}