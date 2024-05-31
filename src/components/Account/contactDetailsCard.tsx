import { GlobeIcon, LinkedinFillIcon, MailFillIcon } from "@/assets/icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import CustomAvatar from "@/components/ui/custom-avatar";
import Link from "next/link";

interface ContactDetailsProps {
  contactDetails: {
    name?: string;
    emails?: string[];
    accountName?: string;
    linkedinUrl?: string;
    website?: string;
    industry?: string;
    description?: string;
  };
}

const ContactDetailsCard: React.FC<ContactDetailsProps> = ({ contactDetails }) => {
  return (
    <Card className="flex-1 bg-white shadow-md rounded-lg overflow-hidden">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-11 h-11">
              <CustomAvatar seed={contactDetails.name + "1"} />
            </div>
            <div className="-mb-[6px]">
              <h1 className="text-2xl font-bold leading-6 text-gray-800 ">{contactDetails.name}</h1>
              <h4 className="text-gray-600">{contactDetails.accountName}</h4>
            </div>
          </div>

          {contactDetails.emails && (
            <div className="flex flex-wrap">
              {contactDetails.emails.map((email, index) => (
                <div key={`email-${index}`} className="flex gap-2 items-center mb-2 flex-wrap">
                  <MailFillIcon
                    className="text-gray-500"
                    height={20}
                    width={20}
                    fill="rgb(107 114 128)"
                  />
                  <p className="text-sm text-gray-600 mr-6 -mb-[2px] underline">{email}</p>
                </div>
              ))}
            </div>
          )}

          {contactDetails.linkedinUrl && (
            <div className="flex gap-2 items-center mb-2">
              <LinkedinFillIcon
                className="text-gray-500"
                fill="rgb(107 114 128)"
                height={18}
                width={18}
              />
              <Link
                href={contactDetails.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 -mb-[2px] hover:underline truncate">
                {contactDetails.linkedinUrl}
              </Link>
            </div>
          )}
          {contactDetails.website && (
            <div className="flex gap-2 items-center mb-2">
              <GlobeIcon height={20} width={20} />
              <Link
                href={contactDetails.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 -mb-[2px] hover:underline truncate">
                {contactDetails.website}
              </Link>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Industry:</h2>
            {contactDetails.industry && (
              <div className="flex flex-col md:flex-row gap-x-2">
                {contactDetails.industry.split(/,|\//).map((industry, index) => (
                  <Badge variant="secondary" className="text-gray-600" key={index}>
                    {industry}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Description:</h2>
            <p className="text-sm text-gray-600 text-justify">{contactDetails.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactDetailsCard;
