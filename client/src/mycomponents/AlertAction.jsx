import React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  CircleCheck,
  Pencil,
  CircleUser,
  CirclePlus,
} from "lucide-react";
import { capitalizeFirstLetter } from "@/utils/utils";

export const DIALOG_STATUS = {
  ADD: "add",
  CONFIRM: "confirm",
  EDIT: "edit",
  DELETE: "delete",
  DEFAULT: "default",
};

const getTriggerButton = (status) => {
  const baseProps = {
    variant: "outline",
    size: "icon",
  };

  switch (status) {
    case DIALOG_STATUS.ADD:
      return (
        <Button {...baseProps}>
          <CirclePlus className="h-4 w-4" />
        </Button>
      );
    case DIALOG_STATUS.CONFIRM:
      return (
        <Button 
          {...baseProps}
          className="text-green-600 hover:bg-green-600 hover:text-white"
        >
          <CircleCheck className="h-4 w-4" />
        </Button>
      );
    case DIALOG_STATUS.EDIT:
      return (
        <Button 
          {...baseProps}
          className="text-blue-600 hover:bg-blue-600 hover:text-white"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      );
    case DIALOG_STATUS.DELETE:
      return (
        <Button 
          {...baseProps}
          className="text-red-600 hover:bg-red-600 hover:text-white"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      );
    default:
      return (
        <Button {...baseProps}>
          <CircleUser className="h-4 w-4" />
        </Button>
      );
  }
};

//Alert choose to proceeed or cancel
export function AlertAction({ onConfirm, description = "Are you sure?", status = DIALOG_STATUS.DEFAULT }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {getTriggerButton(status)}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle></AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-blue-600">{capitalizeFirstLetter(status)}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
