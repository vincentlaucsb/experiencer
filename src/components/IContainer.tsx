export default interface IContainer<P = {}, S = {}> extends React.Component<P, S> {
    addChild: () => void;
    deleteChild: (idx: number) => void;
}