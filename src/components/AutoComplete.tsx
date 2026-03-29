import GooglePlacesAutocomplete, {
	geocodeByAddress,
	getLatLng,
} from "react-google-places-autocomplete";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const AutoGoogleComplete = ({
	defaultValue = "",
	disabled = false,
	onSelect = () => {},
}: {
	defaultValue?: string;
	disabled?: boolean;
	onSelect?: (addr: any) => void;
}) => {
	const handleSelect = async (place: any) => {
		if (disabled || !place) return;
		try {
			const results = await geocodeByAddress(place.label);

			if (!results || results.length === 0) {
				return;
			}

			const addressComponents = results[0].address_components;

			const getAddressComponent = (types: string[], useShortName = false) => {
				const component = addressComponents.find((component: any) =>
					component.types.some((type: string) => types.includes(type))
				);
				return component ? (useShortName ? component.short_name : component.long_name) : "";
			};

			const address1 = `${getAddressComponent([
				"street_number",
			])} ${getAddressComponent(["route"])}`.trim();
			const city =
				getAddressComponent(["locality"]) ||
				getAddressComponent(["sublocality"]) ||
				"";
			const state = getAddressComponent(["administrative_area_level_1"], true); // Use short_name for state
			const zipCode = getAddressComponent(["postal_code"]);
			const country = getAddressComponent(["country"]);

			const { lat, lng } = await getLatLng(results[0]);

			// Allow partial addresses - just need city and state minimum
			// Only US addresses allowed, so country is always "US"
			if (city && state) {
				onSelect({
					address1: address1 || place.label || "", // Use the full label if no street address
					city,
					state,
					zipCode: zipCode || "",
					country: "US", // Always US since we restrict to US only
					lat,
					lng
				});
			}
		} catch (error) {
			// Error fetching address details
		}
	};

	return (
		<GooglePlacesAutocomplete
			apiKey={apiKey}
			autocompletionRequest={{
				componentRestrictions: {
					country: ["us"],
				},
				types: ["address"],
			}}
			selectProps={{
				defaultInputValue: defaultValue,
				onChange: handleSelect,
				styles: {
					control: (base, state) => ({
						...base,
						minHeight: "36px",
						maxHeight: "36px",
						borderColor: state.isFocused ? "#2cccd3" : base.borderColor,
						boxShadow: state.isFocused ? "0 0 0 1px #2cccd3" : base.boxShadow,
						"&:hover": {
							borderColor: state.isFocused ? "#2cccd3" : base.borderColor,
						},
						background: disabled ? "#e8eaed" : base.backgroundColor,
						color: disabled ? "#929497" : base.color,
						pointerEvents: disabled ? "none" : base.pointerEvents,
						cursor: disabled ? "not-allowed" : base.pointerEvents,
					}),
					input: (base, state) => ({
						...base,
						color: disabled ? "#929497" : base.color,
						padding: "0",
						margin: "0",
					}),
					indicatorsContainer: (base) => ({
						...base,
						height: "36px",
					}),
				},
			}}
		/>
	);
};

export default AutoGoogleComplete;
