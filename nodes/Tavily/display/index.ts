import {IDisplayOptions, INodeProperties} from "n8n-workflow";

export function updateDisplayOptions(
	displayOptions: IDisplayOptions,
	properties: INodeProperties[],
) {
	return properties.map((nodeProperty) => {
		return {
			...nodeProperty,
			displayOptions: {
				...nodeProperty.displayOptions,
				...displayOptions
			},
		};
	});
}
