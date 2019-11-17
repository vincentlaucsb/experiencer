export default interface IContainer<P = {}, S = {}> extends React.Component<P, S> {
    defaultChild: JSX.Element;

    addChild: () => void;
    deleteChild: (idx: number) => void;
}