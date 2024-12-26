import Joi from "joi";
import { SuricataEveSearch } from "lib";

export const SuricataEveSearchFiltersValidators = Joi.object<SuricataEveSearch>({
    eventType: Joi.string().optional().allow(""),
    interface: Joi.string().optional().allow(""),
    sourceIp: Joi.string().optional().allow(""),
    sourcePort: Joi.string().optional().allow(""),
    destIp: Joi.string().optional().allow(""),
    destPort: Joi.string().optional().allow(""),
    protocol: Joi.string().optional().allow(""),
    startTime: Joi.string().optional().allow(""),
    endTime: Joi.string().optional().allow(""),
    search: Joi.string().optional().allow(""),
    inverseSearch: Joi.string().optional().allow(""),
});
