export function detectCarrier(phoneNumber: string): "globe" | "smart" | "dito" | "other" {
  if (!phoneNumber) return "globe"; // default fallback

  // Linisin ang number: tanggalin ang mga spaces, dashes, at gawing standard "0" ang bansa (+63 o 63)
  let cleaned = phoneNumber.replace(/[\s-]/g, "");
  if (cleaned.startsWith("+63")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("63") && cleaned.length === 12) {
    cleaned = "0" + cleaned.slice(2);
  }

  // Kunin ang unang 4 na digit (hal. "0917")
  const prefix = cleaned.substring(0, 4);

  // Listahan ng mga prefixes bawat telco sa Pilipinas
  const globePrefixes = [
    "0905", "0906", "0915", "0916", "0917", "0925", "0926", "0927", 
    "0935", "0936", "0937", "0945", "0953", "0954", "0955", "0956", 
    "0965", "0966", "0967", "0975", "0977", "0978", "0979", "0995", "0997"
  ];

  const smartPrefixes = [
    "0907", "0908", "0909", "0910", "0912", "0913", "0914", "0918", 
    "0919", "0920", "0921", "0928", "0929", "0930", "0931", "0938", 
    "0939", "0942", "0943", "0946", "0947", "0948", "0949", "0950", 
    "0951", "0961", "0963", "0968", "0969", "0970", "0981", "0989", 
    "0998", "0999"
  ];

  const ditoPrefixes = [
    "0895", "0896", "0897", "0898", "0991", "0992", "0993", "0994"
  ];

  if (globePrefixes.includes(prefix)) {
    return "globe"; // Sumasakop din sa TM
  } else if (smartPrefixes.includes(prefix)) {
    return "smart"; // Sumasakop din sa TNT at Sun
  } else if (ditoPrefixes.includes(prefix)) {
    return "dito";
  }

  return "globe"; // Safe fallback kung hindi mamapa
}