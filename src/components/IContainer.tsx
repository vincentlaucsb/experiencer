export default interface IContainer<P = {}, S = {}> extends React.Component<P, S> {
    defaultChild: JSX.Element;

    addChild: (data: object) => void;
    deleteChild: (idx: number) => void;
}