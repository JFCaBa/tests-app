// components/ui/use-toast.js
import { useEffect, useState } from "react";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

const toastTimeouts = new Map();

function addToRemoveQueue(toastId) {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
}

export function useToast() {
  const [state, setState] = useState({ toasts: [] });

  useEffect(() => {
    state.toasts.forEach((toast) => {
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => {
          dispatch({
            type: "DISMISS_TOAST",
            toastId: toast.id,
          });
        }, toast.duration);
      }
    });
  }, [state.toasts]);

  function dispatch(action) {
    switch (action.type) {
      case "ADD_TOAST":
        setState((state) => {
          const newState = {
            ...state,
            toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
          };
          return newState;
        });
        break;

      case "UPDATE_TOAST":
        setState((state) => ({
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === action.toast.id ? { ...t, ...action.toast } : t
          ),
        }));
        break;

      case "DISMISS_TOAST":
        setState((state) => {
          const { toastId } = action;
          addToRemoveQueue(toastId);
          return {
            ...state,
            toasts: state.toasts.map((t) =>
              t.id === toastId ? { ...t, open: false } : t
            ),
          };
        });
        break;

      case "REMOVE_TOAST":
        setState((state) => ({
          ...state,
          toasts: state.toasts.filter((t) => t.id !== action.toastId),
        }));
        break;
    }
  }

  function toast({ ...props }) {
    const id = genId();

    const update = (props) =>
      dispatch({
        type: "UPDATE_TOAST",
        toast: { ...props, id },
      });
    const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

    dispatch({
      type: "ADD_TOAST",
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open) => {
          if (!open) dismiss();
        },
      },
    });

    return {
      id,
      dismiss,
      update,
    };
  }

  return {
    toast,
    toasts: state.toasts,
  };
}
