/** 17 U.S.C. § 512(c)(3) notice elements, written for a public DMCA page. */
export const DMCA_NOTICE_REQUIREMENTS = [
  "A physical or electronic signature of the copyright owner, or a person authorized to act on their behalf.",
  "Identification of the copyrighted work claimed to have been infringed. If several works are covered by one notice, a representative list is enough.",
  "Identification of the material that is claimed to be infringing, and information reasonably sufficient to locate it on this site (the exact URL of the page or image).",
  "Your contact information: name, mailing address, telephone number, and email address.",
  "A statement that you have a good-faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.",
  "A statement that the information in the notice is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.",
] as const;

export const DMCA_COUNTER_NOTICE_REQUIREMENTS = [
  "Your physical or electronic signature.",
  "Identification of the material that was removed or disabled, and the location where it appeared before removal.",
  "A statement under penalty of perjury that you have a good-faith belief the material was removed or disabled as a result of mistake or misidentification.",
  "Your name, address, and telephone number, and a statement that you consent to the jurisdiction of the Federal District Court for your address (or any judicial district in which GuessTheGame.net may be found if you are outside the United States), and that you will accept service of process from the person who provided the original notice or their agent.",
] as const;
