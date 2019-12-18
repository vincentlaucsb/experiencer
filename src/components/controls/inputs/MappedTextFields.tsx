import React from "react";

interface MappedTextFieldsState {
    isAddingKey: boolean;
    isEditing: boolean;
    displayMap: Map<string, string>;
    newKey: string;
}

export default class MappedTextFields extends React.Component<{}, MappedTextFieldsState> {
    // Temporary holding buffer that gets modified by reference
    // for efficiency
    data = new Map<string, string>();

    constructor(props) {
        super(props);

        this.state = {
            isAddingKey: false,
            isEditing: false,

            // Actual map that gets rendered
            displayMap: new Map<string, string>(),
            newKey: ""
        };
    }

    get editingButton() {
        const setAddingKey = (b: boolean) => this.setState({ isAddingKey: b });

        if (this.state.isEditing) {
            return (
                <>
                    <button onClick={() => setAddingKey(true)}>Add New Item</button>
                    <button onClick={() => this.setState({ isEditing: false })}>Done Editing</button>
                </>
            )
        }

        return (
            <button onClick={() => this.setState({ isEditing: true })}>Edit</button>
        );
    }

    render() {
        const setDisplayMap = (data: Map<string, string>) => this.setState({ displayMap: data });
        const setNewKey = (key: string) => this.setState({ newKey: key });
        const setAddingKey = (b: boolean) => this.setState({ isAddingKey: b });

        let keyAdder = <></>
        if (this.state.isAddingKey) {
            const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key === 'Enter') {
                    this.data.set(this.state.newKey, '');
                    setDisplayMap(this.data);
                    setAddingKey(false);
                }
            }

            keyAdder = <>
                <input value={this.state.newKey} onChange={(event) => setNewKey(event.target.value)} onKeyDown={onKeyDown} /> <input disabled />
            </>
        }

        return <React.Fragment>
            {Array.from(this.state.displayMap.entries()).map(([key, value]) => {
                const shouldFocus = key === this.state.newKey;

                return <React.Fragment key={key}>
                    <div>
                        {key}
                        <input autoFocus={shouldFocus} onChange={
                            (event) => {
                                this.data.set(key, event.target.value);
                                setDisplayMap(this.data);
                            }
                        }
                            value={value}
                        />
                    </div>
                </React.Fragment>
            }
            )}

            {keyAdder}

            <div>
                {this.editingButton}
            </div>
        </React.Fragment>
    }
}