import ResumeNodeTree, { BasicResumeNode } from "./NodeTree";
import { assignIds } from "../Helpers";

test('getNodeById Test', () => {
    const resumeData = [{
        type: 'Row',
        childNodes: [
            { type: 'Column' },
            { type: 'Column' }
        ]
    }] as BasicResumeNode[];
    
    const data = new ResumeNodeTree(assignIds(resumeData));
    const topNode = data.getNodeById([0]);

    expect(resumeData[0].type).toBe(topNode.type);
    expect(resumeData[0].childNodes).toBeDefined();

    if (resumeData[0].childNodes) {
        expect(resumeData[0].childNodes[1].type).toBe(
            data.getNodeById([0, 1]).type
        );
    }
})