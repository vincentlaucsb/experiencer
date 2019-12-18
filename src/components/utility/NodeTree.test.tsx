import ResumeNodeTree from "./NodeTree";
import { assignIds } from "../Helpers";

test('getNodeById Test', () => {
    const resumeData = [{
        type: 'Row',
        children: [
            { type: 'Column' },
            { type: 'Column' }
        ]
    }];
    
    const data = new ResumeNodeTree(assignIds(resumeData));
    const topNode = data.getNodeById([0]);

    expect(resumeData[0].type).toBe(topNode.type);
    expect(resumeData[0].children[1].type).toBe(
        data.getNodeById([0, 1]).type
    );
})