

export function getNamingConvention(name: string) {
	name = name.toLowerCase().trim();
	// For mega forms
	if(name.includes("mega ")) {
		let temp = name.replace("mega ", "").trim();
		name = temp + "mega";
		return name;
	}
	// for alolan forms
	else if(name.includes("alola") || name.includes("alolan")) {
		let temp = name.replace("alola", "");
		temp = name.replace("alolan", "");
		name = temp + "alola";
		return name;
	}
	// for white kyurem
	else if(name.includes("white ")) {
		let temp = name.replace("white ", "");
		name = temp + "white";
		return name;
	}
	// for black kyurem
	else if(name.includes("black ")) {
		let temp = name.replace("black ", "");
		name = temp + "black";
		return name;
	}
	// for primals
	else if(name.includes("primal")) {
		let temp = name.replace("primal ", "");
		name = temp + "primal";

		return name;
	}
	// for deoxys
	else if(name.includes(" attack") || name.includes(" speed") || name.includes(" defense")) {
		return name.replace(" ", "");
	}
	// for rotom 
	else if(name.includes(" heat") || name.includes(" wash") || name.includes(" mow") || name.includes(" frost") || name.includes(" fan")) {
		return name.replace(" ", "");
	}
	// for Giratina
	else if(name.includes(" altered") || name.includes(" origin")) {
		return name.replace(" ", "");
	}
	// for Shaymin
	else if(name.includes(" land") || name.includes(" sky")) {
		return name.replace(" ", "");
	}
	// for galar pokemon
	else if(name.includes("galar ") || name.includes("galarian ")) {
		let temp = name.replace("galar ", "");
		temp = temp.replace("galarian ", "");
		name = temp + "galar";
		return name;
	}
	// for the legendary trio of gen 5.
	else if(name.includes(" therian")) {
		return name.replace(" ", "");
	}

	// For Ash Greninja
	else if(name.includes("ash ")) {
		let temp = name.replace("ash ", "");
		name = temp + "ash";
		return name;
	}
	
	//For zygarde
	else if(name.includes(" 10") || name.includes(" 50") || name.includes(" complete")) {
		return name.replace(" ", "");
	}
	// For Hoopa Unbound
	else if(name.includes(" unbound")) {
		return name.replace(" ", "");
	}
	// for necromza-dusk-mane
	else if(name.includes("dusk mane ")) {
		let temp = name.replace("dusk mane ", "");
		name = temp + "duskmane";
		return name;
	}
	// for necromza-dawn-wings
	else if(name.includes("dawn wings")) {
		let temp = name.replace("dawn wings ", "");
		name = temp + "dawnwings";
		return name;
	}
	// For lycanroc
	else if(name.includes(" midday") || name.includes(" midnight") || name.includes(" dusk")) {
		return name.replace(" ", "");
	}
	// for zama and zacian
	else if(name.includes(" crowned")) {
		return name.replace(" ", "");
	}
	// for calyrex-ice
	else if(name.includes("ice ")) {
		let temp = name.replace("ice ", "");
		name = temp + "ice";
		return name;
	}
	else if(name.startsWith("tapu")) {
		return name.replace(" ", "");
	}
	// for calyrex-shadow
	// else if(name.includes("shadow")) {
	// 	let temp = name.replace("shadow ", "");
	// 	name = temp + "shadown";
	// 	return name;
	// }


	else return name;
}