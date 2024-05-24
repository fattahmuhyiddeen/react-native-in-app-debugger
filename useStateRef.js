import { useCallback, useRef, useState, SetStateAction, Dispatch } from "react";

const isFunction = (setStateAction) =>
  typeof setStateAction === "function";


export default (initialState) => {
  const [state, setState] = useState(initialState);
  const ref = useRef(state);

  const dispatch = useCallback((setStateAction) => {
    ref.current = isFunction(setStateAction) ? setStateAction(ref.current) : setStateAction;

    setState(ref.current);
  }, []);

  return [state, dispatch, ref];
};
