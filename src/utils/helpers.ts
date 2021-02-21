

export function getNamingConvention(name: string) {
	name = name.toLowerCase().trim();
	if(name.includes("mega ")) {
		let temp = name.replace("mega ", "").trim();
		name = temp + "mega";
		return name;
	}
	else if(name.includes("alola") || name.includes("alolan")) {
		let temp = name.replace("alola", "");
		temp = name.replace("alolan", "");
		name = temp + "alola";
		return name;
	}

	else return name;
}