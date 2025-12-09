interface TokenProperties {
	valid: boolean;
	invalidReason?: string;
	action?: string;
	hostname?: string;
	createTime?: string;
}

interface RiskAnalysis {
	score?: number;
	reasons?: string[];
}

interface AssessmentResponse {
	name: string;
	event: {
		token: string;
		siteKey: string;
	};
	tokenProperties: TokenProperties;
	riskAnalysis?: RiskAnalysis;
}

interface GoogleCredentials {
	client_id: string;
	client_secret: string;
	refresh_token: string;
	type: string;
}

export { TokenProperties, RiskAnalysis, AssessmentResponse, GoogleCredentials };
