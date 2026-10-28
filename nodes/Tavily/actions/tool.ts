import type {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeProperties,
} from 'n8n-workflow';

// Helpers for version 2 of the Tavily Tool (the node attached to an AI Agent).
// Version 1 workflows and the regular Tavily node don't use them.

/** Display condition: show a field only on the Tavily Tool, version 2 and later */
export const TOOL_V2 = { '@tool': [true], '@version': [{ _cnd: { gte: 2 } }] };

/**
 * A field value the model fills in. Uses the same format the editor writes when you click
 * "Let the model define this parameter", so the field shows as model-defined and stays editable.
 */
export const fromAI = (key: string, description: string) =>
	`={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('${key}', \`${description}\`, 'string') }}`;

/** Dropdown value meaning "the model picks this value on each call" */
export const MODEL_CHOICE = 'model';

export function isToolV2(this: IExecuteFunctions): boolean {
	const node = this.getNode();
	return node.typeVersion >= 2 && node.type.endsWith('Tool');
}

/**
 * Reads a field made with modelChoiceField: the fixed value the user picked, or the model's
 * value. Returns undefined when the model's value isn't one of the allowed values, so a value
 * the model gets wrong is ignored instead of failing the call.
 */
export function getChoice(
	this: IExecuteFunctions,
	parameterName: string,
	index: number,
	allowed: string[],
): string | undefined {
	let value = this.getNodeParameter(parameterName, index, '');
	if (value === MODEL_CHOICE) {
		value = this.getNodeParameter(`${parameterName}ByModel`, index, '');
	}
	const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
	return allowed.includes(normalized) ? normalized : undefined;
}

interface ModelChoiceField {
	displayName: string;
	name: string;
	/** Name of the input the model fills in */
	key: string;
	/** Tells the model what the choices mean */
	modelDescription: string;
	description: string;
	choices: Array<{ name: string; value: string }>;
	show: IDataObject;
}

/**
 * A dropdown whose first choice is "Let the Model Decide". The editor can't make a dropdown
 * model-defined in a way users can undo, so a hidden companion field holds the model input
 * and only exists while "Let the Model Decide" is selected.
 */
export function modelChoiceField(field: ModelChoiceField): INodeProperties[] {
	return [
		{
			displayName: field.displayName,
			name: field.name,
			type: 'options',
			options: [{ name: 'Let the Model Decide', value: MODEL_CHOICE }, ...field.choices],
			default: MODEL_CHOICE,
			description: field.description,
			displayOptions: { show: field.show as IDisplayOptions['show'] },
		},
		{
			displayName: `${field.displayName} (Model Input)`,
			name: `${field.name}ByModel`,
			type: 'hidden',
			default: fromAI(field.key, field.modelDescription),
			displayOptions: {
				show: { ...field.show, [field.name]: [MODEL_CHOICE] } as IDisplayOptions['show'],
			},
		},
	];
}
